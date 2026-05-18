import React, { useEffect, useRef } from 'react';

const ChatPanel = ({ messages = [], value, onChange, onSend, onClose }) => {
	const bottomRef = useRef(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: 'end' });
	}, [messages]);

	return (
		<aside className="fixed right-4 top-20 z-40 flex h-[calc(100vh-6rem)] w-[min(92vw,21rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101522]/95 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
			<div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
				<div>
					<div className="text-sm font-semibold text-white">In-call chat</div>
					<div className="text-xs text-white/55">Visible to meeting participants</div>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/5 hover:text-white"
					aria-label="Close chat"
				>
					<span className="material-icons text-[18px]">close</span>
				</button>
			</div>

			<div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
				{messages.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/55">
						No messages yet
					</div>
				) : (
					messages.map((message, index) => {
						const sender = message.senderName || message.displayName || message.sender || message.socketId || 'Guest';
						return (
							<div key={`${sender}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
								<div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9cabff]">{sender}</div>
								<div className="text-sm leading-6 text-white">{message.message}</div>
							</div>
						);
					})
				)}
				<div ref={bottomRef} />
			</div>

			<form
				className="border-t border-white/10 p-3"
				onSubmit={(event) => {
					event.preventDefault();
					onSend?.();
				}}
			>
				<div className="flex gap-2">
					<input
						value={value}
						onChange={(event) => onChange?.(event.target.value)}
						placeholder="Send a message"
						className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#6d7cff]"
					/>
					<button
						type="submit"
						className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#6d7cff] px-4 text-sm font-semibold text-white transition hover:bg-[#5a69f0]"
					>
						Send
					</button>
				</div>
			</form>
		</aside>
	);
};

export default ChatPanel;
