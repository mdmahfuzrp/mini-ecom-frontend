import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    try {
        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Authorization header is missing' }, { status: 401 });
        }

        // Forward the request to the backend API with the auth header
        const response = await axios.get('http://localhost:4000/api/auth/me', {
            headers: {
                Authorization: authHeader,
            },
        });

        // Return the response from the backend
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.log('User profile error:', error);

        // Return error response
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || 'Failed to get user profile',
            },
            { status: error.response?.status || 500 },
        );
    }
}
