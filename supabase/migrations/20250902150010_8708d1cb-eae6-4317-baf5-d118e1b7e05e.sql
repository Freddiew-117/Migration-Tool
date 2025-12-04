-- Add the 6 core XDC contracts
INSERT INTO public.smart_contracts (name, address, network_id, is_active, created_by) VALUES
('CIFI Token V1 (Old)', '0xe5F9AE9D32D93d3934007568B30B7A7cA489C486', 'a4ac3550-69e7-4721-b42c-39d38249912b', true, (SELECT id FROM auth.users WHERE email = 'johnny@elitweb3.com' LIMIT 1)),
('CIFI Token V2 (New)', '0x1932192f2D3145083a37ebBf1065f457621F0647', 'a4ac3550-69e7-4721-b42c-39d38249912b', true, (SELECT id FROM auth.users WHERE email = 'johnny@elitweb3.com' LIMIT 1)),
('REFI Token V1 (Old)', '0xbc24F5f3f09ced3C12322DB67EffB55297816Ef6', 'a4ac3550-69e7-4721-b42c-39d38249912b', true, (SELECT id FROM auth.users WHERE email = 'johnny@elitweb3.com' LIMIT 1)),
('REFI Token V2 (New)', '0x2D010d707da973E194e41D7eA52617f8F969BD23', 'a4ac3550-69e7-4721-b42c-39d38249912b', true, (SELECT id FROM auth.users WHERE email = 'johnny@elitweb3.com' LIMIT 1)),
('REFI Migration Contract', '0x213cc41336Fe4Da4132C9e59082241fE6d5E8453', 'a4ac3550-69e7-4721-b42c-39d38249912b', true, (SELECT id FROM auth.users WHERE email = 'johnny@elitweb3.com' LIMIT 1)),
('CIFI Migration Contract', '0xda95cC3368452958666643Dc6ebB6b15aebF497e', 'a4ac3550-69e7-4721-b42c-39d38249912b', true, (SELECT id FROM auth.users WHERE email = 'johnny@elitweb3.com' LIMIT 1));