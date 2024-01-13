import { Middleware, handler } from '@/lib/middleware';
import { NextResponse } from 'next/server';

const middleware_1: Middleware = async (_req, next) => {
    console.log('Running middleware 1');
    next();
};

const middleware_2: Middleware = async (_req, next) => {
    console.log('Running middleware 2');

    // sleep for 2.5 seconds
    console.log('Sleeping for 2.5 seconds');
    await new Promise((resolve) => setTimeout(resolve, 2500));

    next();
};

const middleware_3: Middleware = async (_req, next) => {
    console.log('Running middleware 3');

    // Fetch data from json api
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const json = await res.json();
    console.log(json);

    next();
};

const middleware_4: Middleware = async (_req, next) => {
    console.log('Running middleware 4');
    next();
};

const hello = async (req: Request) => {
    return NextResponse.json({ data: 'Hello World' });
};

export const GET = handler(
    middleware_1,
    middleware_2,
    middleware_3,
    middleware_4,
    hello,
);
