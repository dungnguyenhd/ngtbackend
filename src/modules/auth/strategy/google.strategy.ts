/* eslint-disable @typescript-eslint/no-var-requires */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID:
        '919992439024-d8val5ah4pm6o9b245vvj5pk5qf5sc26.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL:
        'https://ngtbackend-v1.fly.dev/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(profile: any): Promise<any> {
    let user;
    const googleInfoUri = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const axios = require('axios');
    const config2 = {
      method: 'get',
      url: `${googleInfoUri}?access_token=${profile}`,
      headers: {},
    };

    await axios(config2).then(function (response) {
      user = {
        name: response.data.name,
        picture: response.data.picture,
        email: response.data.email,
        sub: response.data.sub,
      };
    });
    return user;
  }
}
