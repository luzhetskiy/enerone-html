import { getHeaderHeight } from '../functions/header-height.js'
import { throttle } from '../functions/throttle.js';

getHeaderHeight()
window.addEventListener('resize', throttle(getHeaderHeight))
