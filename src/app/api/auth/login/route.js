import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const credentials = await request.json();

        // Forward the request to the backend API
        const response = await axios.post('http://localhost:4000/api/auth/login', credentials);

        // Return the response from the backend
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.log('Login error:', error);

        // Return error response
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || 'Invalid credentials. Please try again.',
            },
            { status: error.response?.status || 500 },
        );
    }
}
