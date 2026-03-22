-- 1. Fix Chat Deletion RLS
-- Currently, users cannot delete their own chats because there is no DELETE policy.
CREATE POLICY "Users can delete their own chats."
  ON public.chats FOR DELETE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 2. Final Fix for Image Visibility
-- This makes the product-images bucket public so users can view images uploaded by others.
UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- 3. Optimization: Add index for message replies if not exists
-- This helps when fetching replied messages.
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id);
