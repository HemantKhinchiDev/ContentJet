import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'ContentJet - AI Content Generator'

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0f172a',
                    backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                    }}
                >
                    <h1
                        style={{
                            fontSize: '64px',
                            fontWeight: 'bold',
                            color: 'white',
                            textAlign: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        {title}
                    </h1>
                    <p
                        style={{
                            fontSize: '32px',
                            color: '#94a3b8',
                            textAlign: 'center',
                        }}
                    >
                        Create Content 10x Faster with AI
                    </p>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    )
}
