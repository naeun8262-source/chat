import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { csvParse } from 'd3-dsv';
import { pc, indexName } from '@/lib/pinecone';
import { supabase } from '@/lib/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';

export async function POST() {
  try {
    const csvFilePath = path.join(process.cwd(), 'samples', 'analysis.csv');
    console.log('Reading CSV from:', csvFilePath);
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found at ${csvFilePath}`);
    }

    const fileContent = fs.readFileSync(csvFilePath, 'utf8').trim();
    const data = csvParse(fileContent);
    console.log('Parsed rows:', data.length);

    if (data.length === 0) {
      throw new Error('CSV file is empty or parsing failed');
    }

    // 1. Setup Embeddings
    const embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 2. Sync with Supabase (Optional sync)
    try {
      const formattedData = data.map((row) => ({
        timestamp: row.timestamp,
        user_id: row.user_id,
        neck_angle: parseFloat(row.neck_angle || '0'),
        trunk_angle: parseFloat(row.trunk_angle || '0'),
        upper_arm_angle: parseFloat(row.upper_arm_angle || '0'),
        lower_arm_angle: parseFloat(row.lower_arm_angle || '0'),
        wrist_score: parseInt(row.wrist_score || '0'),
        leg_supported: row.leg_supported?.toLowerCase() === 'true',
        monitor_distance_cm: parseInt(row.monitor_distance_cm || '0'),
        rula_score: parseInt(row.rula_score || '0'),
        risk_level: row.risk_level,
        vdt_compliant: row.vdt_compliant?.toLowerCase() === 'true',
      }));

      await supabase
        .from('posture_analysis')
        .upsert(formattedData, { onConflict: 'timestamp,user_id' });
      console.log('Supabase sync attempted');
    } catch (sbError) {
      console.warn('Supabase sync error ignored:', sbError);
    }

    // 3. Index in Pinecone
    const pineconeIndex = pc.Index(indexName);
    const docs = data.map((row) => {
      const content = `User ${row.user_id} analysis at ${row.timestamp}: 
      Neck: ${row.neck_angle}°, Trunk: ${row.trunk_angle}°, 
      Upper Arm: ${row.upper_arm_angle}°, Lower Arm: ${row.lower_arm_angle}°, 
      Wrist Score: ${row.wrist_score}, Monitor Dist: ${row.monitor_distance_cm}cm. 
      RULA Score: ${row.rula_score}, Risk Level: ${row.risk_level}, VDT Compliant: ${row.vdt_compliant}`;
      
      return {
        pageContent: content,
        metadata: { 
          ...row,
          leg_supported: row.leg_supported?.toLowerCase() === 'true',
          vdt_compliant: row.vdt_compliant?.toLowerCase() === 'true'
        },
      };
    });

    console.log('Indexing documents in Pinecone...');
    
    // Using fromDocuments directly
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
    });
    
    console.log('Pinecone indexing successful');

    return NextResponse.json({ success: true, count: docs.length });
  } catch (error: any) {
    console.error('Ingestion error details:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
