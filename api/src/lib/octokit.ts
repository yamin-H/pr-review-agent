import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import fs from 'fs'

const privateKey = fs.readFileSync(
    process.env.GITHUB_PRIVATE_KEY_PATH!,
    'utf8'
);

const appAuth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey,
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!
});

export async function getInstallationOctokit(installationId: number) {
    const auth = await appAuth({
        type: 'installation',
        installationId
    });

    return new Octokit({ auth: auth.token });
}

export async function getInstallationToken(installationId: number): Promise<string> {
    const auth = await appAuth({
        type: 'installation',
        installationId
    });
    return auth.token;
};