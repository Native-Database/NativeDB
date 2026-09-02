import {readFile} from 'fs/promises';
import path from 'path';
import {NextResponse} from 'next/server';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'xml', 'converter.xml');
    const xml = await readFile(filePath, 'utf8');

    return new NextResponse(xml, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/xml; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Failed to load converter XML:', error);
    return NextResponse.json({error: 'Converter XML could not be loaded'}, {status: 500});
  }
}