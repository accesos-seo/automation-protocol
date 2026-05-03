<#
.SYNOPSIS
Shared helper for invoking Supabase Edge Functions used by the shared automation pipeline.

.DESCRIPTION
This helper does not execute tests by itself. It only centralizes authenticated POST calls.
Do not commit real tokens. Pass tokens through environment variables or secure local profile.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-SharedAutomationFunction {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string] $SupabaseUrl,

        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string] $AuthToken,

        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string] $FunctionName,

        [Parameter(Mandatory = $true)]
        [hashtable] $Payload
    )

    $uri = "$($SupabaseUrl.TrimEnd('/'))/functions/v1/$FunctionName"

    $headers = @{
        "Authorization" = "Bearer $AuthToken"
        "apikey"        = $AuthToken
        "Content-Type"  = "application/json"
    }

    $body = $Payload | ConvertTo-Json -Depth 50

    try {
        return Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body
    }
    catch {
        $message = $_.Exception.Message
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $message = $_.ErrorDetails.Message
        }
        throw "Supabase function call failed: function=$FunctionName uri=$uri message=$message"
    }
}
