

export const ChatBubble = ({ chat, sender }: { chat: string, sender: boolean }) => {
    return (
        <div style={{ display: 'flex', justifyContent: sender === true ? 'start' : 'end'}}>
            <div style={{ padding:'6px 12px', borderRadius: '5px', border: 'none', background: 'darkgray', width: 'fit-content', fontSize: '16px' }}>
                {chat}
            </div>
        </div>
    )
}