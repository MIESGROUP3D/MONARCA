# Monarca · Visor 3D y Realidad Aumentada

Web para explorar el edificio **Monarca** en 3D interactivo y colocarlo a escala
en tu espacio con Realidad Aumentada (misma tecnología que MIES-AR:
Google `<model-viewer>` + WebXR / Scene Viewer / Quick Look).

## Cómo integrar el modelo 3D

La página ya está lista y espera dos archivos en la **raíz** del proyecto:

| Archivo        | Para qué sirve                                  |
|----------------|--------------------------------------------------|
| `monarca.glb`  | Visor 3D web + AR en Android (Scene Viewer)      |
| `monarca.usdz` | AR en iPhone/iPad (ARKit · Quick Look)           |

Solo hay que copiarlos ahí — no se necesita tocar el código. Mientras no
existan, la página muestra "Modelo en preparación".

Recomendaciones para el `.glb`:
- Peso ideal < 15 MB (comprimir texturas, Draco si es posible).
- Origen del modelo en el suelo (Y=0) para que ancle bien en AR.
- Escala real en metros (AR usa `ar-scale="auto"`).

## Publicar en GitHub Pages

1. Crear un repositorio en GitHub y subir todo el contenido de esta carpeta a `main`.
2. En **Settings → Pages**, elegir **Source: GitHub Actions**.
3. El workflow `.github/workflows/deploy-pages.yml` despliega automáticamente en cada push.

## Analítica (opcional)

Editar `analytics.js` y reemplazar `G-XXXXXXXXXX` por el Measurement ID de GA4.

## Estructura

```
index.html      Página principal (visor + AR)
styles.css      Estilos (paleta café claro)
app.js          Lógica del visor y AR
analytics.js    GA4 (desactivada por defecto)
assets/         Favicons
```
