-- Create posture_analysis table
CREATE TABLE IF NOT EXISTS public.posture_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id TEXT NOT NULL,
    neck_angle FLOAT NOT NULL,
    trunk_angle FLOAT NOT NULL,
    upper_arm_angle FLOAT NOT NULL,
    lower_arm_angle FLOAT NOT NULL,
    wrist_score INTEGER NOT NULL,
    leg_supported BOOLEAN NOT NULL,
    monitor_distance_cm INTEGER NOT NULL,
    rula_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL,
    vdt_compliant BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(timestamp, user_id)
);

-- Enable RLS
ALTER TABLE public.posture_analysis ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.posture_analysis
    FOR SELECT USING (true);

-- Allow public insert/update access (for sample indexing)
CREATE POLICY "Allow public insert access" ON public.posture_analysis
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.posture_analysis
    FOR UPDATE USING (true) WITH CHECK (true);

