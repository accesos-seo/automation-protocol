# Handover Index

Este directorio centraliza los handovers operativos del protocolo.

## Estructura

```text
handover/
├── README.md
├── _templates/
│   └── AUTOMATION-HANDOVER.md
├── automations/
│   └── example-shared-automation-HANDOVER.md
└── ai-sessions/
    └── NEXT_AI_SESSION_BLOCK_HANDOVER.md
```

## Uso

- `handover/_templates/` contiene plantillas reutilizables.
- `handover/automations/` contiene handovers por automatización.
- `handover/ai-sessions/` contiene handovers de continuidad entre sesiones de IA.

## Regla operativa

No ejecutar pruebas finales ni activación desde esta carpeta. Los handovers documentan estado, evidencias y pendientes; la ejecución runtime requiere autorización explícita separada.
