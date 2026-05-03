# 2026-05-03 20:45 - Inventario Completo GitHub Skills

## Correccion de rumbo

El usuario marco correctamente que no basta hablar de 3 skills registradas en Supabase. La meta correcta es mapear todas las skills existentes en GitHub contra Supabase `skill_registry` y Supabase Storage.

## Supabase actual

```text
skill_registry = 3
storage.objects = 0
```

## GitHub skills detectadas

```text
automations/_template/skills/scaffold-validation/SKILL.md
automations/_template/skills/technical-deployment/SKILL.md
automations/_template/skills/web-source-capture/SKILL.md
automations/automation-template/skills/intake-analysis/SKILL.md
automations/automation-template/skills/requirements-validation/SKILL.md
automations/example-shared-automation/skills/intake-analysis/SKILL.md
```

## Faltantes confirmados

```text
_template/scaffold-validation -> no registrado en skill_registry
_template/technical-deployment -> no registrado en skill_registry
_template/web-source-capture -> no registrado en skill_registry

Todos los paquetes Storage -> faltantes porque storage.objects = 0
```

## Nuevo plan correcto

```text
1. Completar inventario GitHub skills.
2. Registrar en Supabase las skills faltantes de _template como status = template.
3. Empaquetar todas las skills que requieran runtime package.
4. Subir paquetes al bucket skills.
5. Verificar storage.objects y checksums.
6. Actualizar skill_registry con hashes si se adopta esa regla.
```

## Seguridad

```text
No se modifico Supabase en este bloque.
No se subio Storage.
No se ejecutaron pruebas finales.
No se activo ninguna automatizacion.
```
