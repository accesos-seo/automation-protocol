# 06 - Seguridad y secrets

Nunca subir .env real. Nunca subir API keys, tokens, service role keys o secrets a GitHub. Sí subir .env.example sin valores reales. Las tablas pueden guardar metadata del secret, pero nunca el valor real. Todo valor faltante se marca como PENDING_CONFIG.
