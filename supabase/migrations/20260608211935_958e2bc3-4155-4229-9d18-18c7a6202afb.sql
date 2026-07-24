
-- borrower-documents: users manage their own folder ({uid}/...)
CREATE POLICY "Users manage own documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'borrower-documents' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'borrower-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Staff read all documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'borrower-documents' AND public.is_staff(auth.uid()));

-- repayment-proofs: users manage their own folder
CREATE POLICY "Users manage own proofs" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'repayment-proofs' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'repayment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Staff read all proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'repayment-proofs' AND public.is_staff(auth.uid()));
