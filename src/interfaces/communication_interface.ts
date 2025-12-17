// Abstract Communication Layer

export async function sendGuidance(recipient: string, content: string): Promise<void> {
    // In production, this would use Resend / SendGrid
    console.log(`[COMMUNICATION] Sending Guidance to ${recipient}:`);
    console.log(`> "${content}"`);
}

export async function sendVerification(recipient: string, token: string): Promise<void> {
    console.log(`[COMMUNICATION] Sending Verification to ${recipient}:`);
    console.log(`> Magic Link Token: ${token}`);
}
