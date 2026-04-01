import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(details: {
        email: string;
        firstName: string;
        lastName: string;
        picture: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        password: string;
        image: string | null;
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    findUserById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        password: string;
        image: string | null;
    } | null>;
}
