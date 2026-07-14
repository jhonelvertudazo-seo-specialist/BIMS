import { sectorBadgeClass } from '../../utils/constants.js';

export default function SectorBadge({ sector }) {
    return <span className={`badge ${sectorBadgeClass(sector)} sector-tag`}>{sector}</span>;
}
