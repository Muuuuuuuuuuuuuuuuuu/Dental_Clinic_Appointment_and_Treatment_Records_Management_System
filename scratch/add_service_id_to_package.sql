ALTER TABLE "public"."treatment_package" 
ADD COLUMN IF NOT EXISTS "service_id" bigint REFERENCES "public"."service"("service_id") ON DELETE SET NULL;

COMMENT ON COLUMN "public"."treatment_package"."service_id" IS 'Links this package to a specific service. If null, the package applies to all services.';
