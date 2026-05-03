# 08 - Rollback

Todo despliegue debe rastrearse a deployment_job_id, commit_sha y manifest. El rollback mínimo identifica deployment_job fallido, commit previo, revierte manifests o código, marca la automatización como inactive, blocked o rollback_required, y registra deployment.rollback_requested. Migraciones destructivas requieren aprobación explícita.
