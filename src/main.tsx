(window as any).TONE_SILENCE_VERSION_LOGGING = false;

import { render } from 'preact';
import RenderCanvas from './components/canvas/RenderCanvas';

render(<RenderCanvas width={640} height={360} fps={-1} />, document.getElementById('app') as HTMLElement);
