import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

export const register = async ( req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists in profiles
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.',
            });
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name },
        });

        if (authError || !authData.user) {
            return res.status(400).json({
                success: false,
                message: authError?.message || 'Failed to create user.',
            });
        }

        // Create user profile in the database
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                name,
                email,
            });

        if (profileError) {
            // Rollback: delete the user from Auth if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return res.status(500).json({
                success: false,
                message: 'Failed to create user profile.',
            });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const login = async ( req: Request, res: Response ) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', data.user?.id)
            .maybeSingle();
        
        res.json({
            success: true,
            message: 'Login successful.',
            token: data.session?.access_token,
            user: profile,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}