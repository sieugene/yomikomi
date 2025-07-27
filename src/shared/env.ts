type EnvKeys = "";

class EnvConfig {
  private readonly env: Record<EnvKeys, string>;

  constructor() {
    this.env = {
      "": "-",
    };
    this.validate();
  }

  private validate() {
    Object.entries(this.env).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
      }
    });
  }

  public get(key: keyof typeof this.env): string {
    return this.env[key];
  }
}

export const ENV = new EnvConfig();
