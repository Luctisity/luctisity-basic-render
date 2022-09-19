import { render } from 'preact';
import RenderCanvas from './components/canvas/RenderCanvas';

render(<RenderCanvas width={640} height={360} />, document.getElementById('app') as HTMLElement);
