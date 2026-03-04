-- Allow users to delete their own sim orders
CREATE POLICY "Users can delete sim orders"
ON public.sim_orders FOR DELETE
USING (sim_account_id IN (
  SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()
));

-- Allow users to delete their own sim transactions
CREATE POLICY "Users can delete sim transactions"
ON public.sim_transactions FOR DELETE
USING (sim_account_id IN (
  SELECT id FROM public.sim_accounts WHERE user_id = auth.uid()
));