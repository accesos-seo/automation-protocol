# 04 - Fase 3: Technical Deployer

La Fase 3 recibe el scaffold técnico validado desde Fase 2 y lo convierte en una automatización registrada, versionada y lista para operar.

Principio: Scaffold validado -> Configuración técnica -> Versionado -> Deploy -> Automatización activa.

El Deployer no debe inventar credenciales, tokens, secrets, repositorios no autorizados, variables de entorno no documentadas ni cambios de arquitectura no registrados.

Flujo: recibir handoff, crear deployment_job, validar entrada, generar deployment_plan, resolver configs, bloquear si falta algo crítico, publicar a GitHub, preparar Supabase, registrar agentes y skills, ejecutar validator, actualizar automation_registry y activar solo si todo pasa.

Estados: deploy_queued, deploy_input_validating, deploy_preparing, deploy_config_checking, deploy_github_publishing, deploy_supabase_applying, deploy_agent_registering, deploy_validation_running, deploy_completed, deploy_blocked, deploy_failed, automation_active.
