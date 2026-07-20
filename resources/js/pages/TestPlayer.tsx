import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
    DefaultVideoLayout,
    defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';


import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function TestPlayer() {
    return (
        <div style={{ width: '900px', margin: '50px auto' }}>
            <MediaPlayer
                title="Test"
                src="https://files.vidstack.io/sprite-fight/720p.mp4"
            >
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
            </MediaPlayer>
        </div>
    );
}