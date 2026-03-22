-- 1. Fix Chat Deletion RLS
-- Currently, users cannot delete their own chats because there is no DELETE policy.
CREATE POLICY "Users can delete their own chats."
  ON public.chats FOR DELETE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 2. Final Fix for Image Visibility
-- Add missing columns for product enhancements
alter table public.products add column if not exists description text default '';
alter table public.products add column if not exists image_urls text[] default '{}';
alter table public.products add column if not exists tags text[] default '{}';

-- Ensure public bucket exists and is public
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true) 
on conflict (id) do update set public = true WHERE id = 'product-images';

-- 3. Optimization: Add index for message replies if not exists
-- This helps when fetching replied messages.
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON public.messages(reply_to_id);
