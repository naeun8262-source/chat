import { NextResponse } from 'next/server';
import { pc, indexName } from '@/lib/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';

// Manual implementation of formatDocumentsAsString
const formatDocuments = (docs: any[]) => {
  return docs.map((doc) => doc.pageContent).join('\n\n');
};

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    console.log('Chat request received:', message);

    // 1. Setup Embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 2. Setup Vector Store
    const pineconeIndex = pc.Index(indexName);
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    const retriever = vectorStore.asRetriever({
      k: 3,
    });

    // 3. Setup LLM (Removed temperature as it's unsupported by gpt-5-nano)
    const llm = new ChatOpenAI({
      modelName: 'gpt-5-nano',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 4. Setup Prompt
    const systemTemplate = `
너는 '자세히봐 AI'의 전문 에르고노미스트(인체공학 전문가)야. 
제공된 사용자 자세 분석 데이터를 바탕으로 사용자의 질문에 친절하고 전문적으로 답변해줘.

분석 데이터 컨텍스트:
{context}

사용자의 현재 상황이나 데이터에 기반해 개선 방안이나 RULA 점수에 대한 설명을 제공해줘. 
의학적 진단이 아니라는 점을 명시하고, 항상 한국어로 답변해줘.
`;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['human', '{input}'],
    ]);

    // 5. Create RAG Chain using LCEL
    const ragChain = RunnableSequence.from([
      {
        context: async (input: string) => {
          const docs = await retriever.invoke(input);
          return formatDocuments(docs);
        },
        input: new RunnablePassthrough(),
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    // 6. Invoke Chain
    console.log('Retrieving context...');
    const contextDocs = await retriever.invoke(message);
    console.log('Context retrieved:', contextDocs?.length || 0, 'documents');
    
    const response = await ragChain.invoke(message);
    console.log('AI response generated');

    return NextResponse.json({ 
      answer: response,
      sources: contextDocs.map((doc: any) => doc.metadata)
    });

  } catch (error: any) {
    console.error('Chat error details:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'AI 응답 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
