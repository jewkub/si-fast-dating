// Import the Secret Manager client and instantiate it:
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
const client = new SecretManagerServiceClient();
const Secret = {
  get: async (name: string, version?: number) => {
    let [data] = await client.accessSecretVersion({
      name: `${ name }/versions/${ version || 'latest' }`
    });
    // Extract the payload as a string.
    return data?.payload?.data?.toString() ?? '';
  },
  load: async () => {
    const [secrets] = await client.listSecrets({
      parent: 'projects/299024866803',
    });
    
    await Promise.all(secrets.map(async secret => {
      const name = secret?.name?.replace(/^(projects\/299024866803\/secrets\/)/, '') ?? '';
      process.env[name] = process.env[name] || await Secret.get(secret?.name ?? '');
    })); // https://stackoverflow.com/a/31414472
    // https://stackoverflow.com/questions/22312671/setting-environment-variables-for-node-to-retrieve#comment62989081_35317795
  }
}

export { Secret };
