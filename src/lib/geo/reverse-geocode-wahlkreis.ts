/**
 * Vereinfachtes Reverse-Geocoding via Nominatim (OpenStreetMap).
 * Gibt den Ortsnamen zurueck, damit auf Client-Seite gegen Wahlkreis-Namen
 * gematcht werden kann.
 *
 * Vollstaendiges Geometrie-basiertes Matching wird implementiert, sobald
 * Wahlkreis-GeoJSON importiert ist.
 */
export async function reverseGeocodeWahlkreis(
  lat: number,
  lng: number,
): Promise<{ wahlkreisId: number; name: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=de&zoom=10`,
      {
        headers: { 'User-Agent': 'Demokrat/1.0' },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.county ||
      '';

    // wahlkreisId 0 signalisiert, dass kein exakter Match moeglich ist —
    // der Client nutzt den Namen, um ueber die Suche zu matchen.
    return city ? { wahlkreisId: 0, name: city } : null;
  } catch {
    return null;
  }
}
