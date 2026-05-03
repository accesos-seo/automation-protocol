# 07 - Flujo real de despliegue

1. Fase 2 produce handoff-to-deployer.json. 2. Fase 3 crea deployment_job. 3. Se valida la entrada. 4. Se genera deployment_plan. 5. Se resuelven configs. 6. Si falta algo crítico, deploy_blocked. 7. Si todo está listo, se publica a GitHub. 8. Se aplican migraciones y funciones en Supabase. 9. Se registran agentes y skills. 10. Se ejecuta Deployment Validator. 11. Se actualiza automation_registry. 12. Se activa la automatización.
