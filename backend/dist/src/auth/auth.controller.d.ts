import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any, res: Response): Promise<void>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string | null;
        password: string;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
