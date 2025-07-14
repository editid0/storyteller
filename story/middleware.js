import { Logger } from 'next-axiom'
import { NextResponse } from 'next/server'

export async function middleware(request, event) {
    const logger = new Logger({ source: 'middleware' }); // traffic, request
    logger.middleware(request)

    event.waitUntil(logger.flush())
    return NextResponse.next()
}
// For more information, see Matching Paths below
export const config = {
}