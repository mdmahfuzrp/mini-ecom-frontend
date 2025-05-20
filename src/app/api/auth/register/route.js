import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const userData = await request.json();

        // Forward the request to the backend API
        const response = await axios.post('http://localhost:4000/api/auth/register', userData);

        // Return the response from the backend
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.log('Registration error:', error);

        // Return error response
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.',
            },
            { status: error.response?.status || 500 },
        );
    }
}
