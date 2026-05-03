# 05 - Mapa de residencia

Si es código, manifiesto, regla, skill, script o recurso interno del skill, vive en GitHub. Si es estado, evento, log, configuración metadata o activación, vive en Supabase. Si es secreto real, vive en Supabase Secrets o entorno seguro.

Agent Skills: un skill es una carpeta portable con SKILL.md y puede incluir scripts/, references/, assets/ y otros recursos. Todo script o recurso inseparable de una capacidad del agente debe vivir dentro de esa carpeta skill.

Skills -> GitHub + skill_registry. Scripts propios -> skills/[skill]/scripts. Resources propios -> skills/[skill]/assets o references. Snapshots web -> Source Evidence / Supabase Storage. Automatización activa -> automation_registry.
