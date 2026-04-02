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
        email: string;
        name: string | null;
        password: string;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    findUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        password: string;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
