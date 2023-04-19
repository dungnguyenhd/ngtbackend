import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from "./jwt.payload";

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
      ) {}

      public async validateByJwt(payload: JwtPayload) {
        // const user = await this.prismaService.user.findByUnique({ user_name: payload.username });
        // user && delete user.password;
    
        // return user;
      }
    
}