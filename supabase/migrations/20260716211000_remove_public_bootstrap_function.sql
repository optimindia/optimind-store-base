-- Bootstrap access is assigned from the authenticated-user record by OptiMind,
-- never through a browser-callable privileged function.
drop function if exists public.claim_platform_access();
