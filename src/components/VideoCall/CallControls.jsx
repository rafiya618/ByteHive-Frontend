import React from 'react';

const ControlButton = ({ active, danger, onClick, label, icon }) => (
	<button
		type="button"
		onClick={onClick}
		title={label}
		aria-label={label}
		aria-pressed={active}
		className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${
			danger
				? 'border-[#3a1f24] bg-[#352127] text-[#ff8f98] hover:bg-[#462930]'
				: active
					? 'border-white/10 bg-white/10 text-white hover:bg-white/15'
					: 'border-white/10 bg-[#151b2a] text-white/80 hover:bg-white/8'
		}`}
	>
		<span className="material-icons text-[20px]">{icon}</span>
	</button>
);

const CallControls = ({
	isJoined,
	micEnabled,
	camEnabled,
	isScreenSharing,
	onToggleMic,
	onToggleCam,
	onToggleScreenShare,
	onLeave,
	onJoin,
	onToggleChat,
}) => {
	return (
		<div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#0f1624]/92 px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
			{!isJoined ? (
				<button
					type="button"
					onClick={onJoin}
					className="inline-flex items-center gap-2 rounded-full bg-[#6d7cff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5a69f0]"
				>
					<span className="material-icons text-[18px]">meeting_room</span>
					Join
				</button>
			) : (
				<>
					<ControlButton active={micEnabled} onClick={onToggleMic} label={micEnabled ? 'Mute microphone' : 'Unmute microphone'} icon={micEnabled ? 'mic' : 'mic_off'} />
					<ControlButton active={camEnabled} onClick={onToggleCam} label={camEnabled ? 'Turn off camera' : 'Turn on camera'} icon={camEnabled ? 'videocam' : 'videocam_off'} />
					<ControlButton active={isScreenSharing} onClick={onToggleScreenShare} label={isScreenSharing ? 'Stop screen share' : 'Present screen'} icon={isScreenSharing ? 'stop_screen_share' : 'screen_share'} />
					<ControlButton active={false} onClick={onToggleChat} label="Open chat" icon="chat" />
					<ControlButton danger onClick={onLeave} label="Leave call" icon="call_end" />
				</>
			)}
		</div>
	);
};

export default CallControls;
