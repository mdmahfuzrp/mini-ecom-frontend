import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const orderData = await request.json();

        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');

        // Forward the request to the backend API with the auth header
        const response = await axios.post('http://localhost:4000/api/orders', orderData, {
            headers: {
                Authorization: authHeader || '',
            },
        });

        // Return the response from the backend
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.log('Order creation error:', error);

        // Return error response
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || 'Failed to create order',
            },
            { status: error.response?.status || 500 },
        );
    }
}

export async function GET(request) {
    try {
        // Get authorization header from the incoming request
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ success: false, message: 'Authorization header is missing' }, { status: 401 });
        }

        // Extract user ID from the query parameters if available
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let url = 'http://localhost:4000/api/orders';
        if (userId) {
            url += `?userId=${userId}`;
        }

        // Forward the request to the backend API with the auth header
        const response = await axios.get(url, {
            headers: {
                Authorization: authHeader,
            },
        });

        // Return the response from the backend
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.log('Orders fetch error:', error);

        // Return error response
        return NextResponse.json(
            {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch orders',
            },
            { status: error.response?.status || 500 },
        );
    }
}
