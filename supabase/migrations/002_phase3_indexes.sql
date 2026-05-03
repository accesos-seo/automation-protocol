create index if not exists idx_deployment_jobs_status on public.deployment_jobs(deploy_status);
create index if not exists idx_deployment_configs_job on public.deployment_configs(deployment_job_id);
create index if not exists idx_skill_registry_automation on public.skill_registry(automation_key);
create index if not exists idx_agent_registry_automation on public.agent_registry(automation_key);
