-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name text NOT NULL, -- Unique chat between two users
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_name ON public.messages(room_name);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_room_name ON messages(room_name);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_room_receiver_read ON messages(room_name, receiver_id, is_read);



-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Only sender or receiver can read messages
CREATE POLICY "Allow sender/receiver to read messages"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Only sender can insert messages
CREATE POLICY "Allow sender to insert messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow receiver to update messages (for marking as read)
CREATE POLICY "Allow receiver to update messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Optional: sender can delete own messages
CREATE POLICY "Allow sender to delete messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);