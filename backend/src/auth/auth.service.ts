import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(details: { email: string; firstName: string; lastName: string; picture: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: details.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: details.email,
          name: `${details.firstName} ${details.lastName}`,
          image: details.picture,
          password: '', // Not used for Google OAuth
        },
      });
    } else {
      // Update user info if it changed
      user = await this.prisma.user.update({
        where: { email: details.email },
        data: {
          name: `${details.firstName} ${details.lastName}`,
          image: details.picture,
        },
      });
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
