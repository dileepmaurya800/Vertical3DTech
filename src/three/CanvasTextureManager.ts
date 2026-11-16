import * as THREE from 'three';
import { FaceGraphics, MeshPartId } from '../types/configurator';

export class CanvasTextureManager {
  private textures: Map<MeshPartId, THREE.CanvasTexture> = new Map();
  private canvases: Map<MeshPartId, HTMLCanvasElement> = new Map();
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private maxAnisotropy = 8;

  constructor(maxAnisotropy = 8) {
    this.maxAnisotropy = maxAnisotropy;
  }

  /**
   * Get or create a dynamic CanvasTexture for a specific tent part
   */
  public getOrCreateTexture(
    partId: MeshPartId,
    graphics: FaceGraphics,
    baseColor: string,
    isValance = false
  ): THREE.CanvasTexture {
    let canvas = this.canvases.get(partId);
    let texture = this.textures.get(partId);

    const width = 1024;
    const height = isValance ? 256 : 1024;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      this.canvases.set(partId, canvas);

      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = this.maxAnisotropy;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      this.textures.set(partId, texture);
    }

    this.drawCanvas(canvas, graphics, baseColor, isValance, () => {
      if (texture) {
        texture.needsUpdate = true;
      }
    });

    if (texture) {
      texture.needsUpdate = true;
    }

    return texture!;
  }

  /**
   * Render the background color, fabric weave pattern, custom logo, and text
   */
  private drawCanvas(
    canvas: HTMLCanvasElement,
    graphics: FaceGraphics,
    baseColor: string,
    isValance: boolean,
    onAsyncImageLoaded: () => void
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const fillColor = graphics.color || baseColor;

    // 1. Draw Base Fabric Color
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Subtle Fabric Weave Pattern for Realism
    this.drawFabricWeave(ctx, width, height, fillColor);

    // 3. Draw Uploaded Logo (if present)
    if (graphics.logoUrl) {
      let cachedImg = this.imageCache.get(graphics.logoUrl);

      if (!cachedImg) {
        cachedImg = new Image();
        cachedImg.crossOrigin = 'anonymous';
        cachedImg.src = graphics.logoUrl;
        cachedImg.onload = () => {
          this.imageCache.set(graphics.logoUrl!, cachedImg!);
          // Redraw when image finishes loading
          this.drawCanvas(canvas, graphics, baseColor, isValance, onAsyncImageLoaded);
          onAsyncImageLoaded();
        };
      } else if (cachedImg.complete && cachedImg.naturalWidth > 0) {
        this.renderLogo(ctx, cachedImg, graphics, width, height, isValance);
      }
    }

    // 4. Draw Custom Text
    if (graphics.text && graphics.text.trim().length > 0) {
      this.renderText(ctx, graphics, width, height, isValance);
    }
  }

  /**
   * Draw microscopic fabric weave texture using canvas pattern
   */
  private drawFabricWeave(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    _baseHex: string
  ) {
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    // Grid lines spacing
    const step = 6;
    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Render custom uploaded logo with user scale, offset, and rotation
   */
  private renderLogo(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    graphics: FaceGraphics,
    canvasWidth: number,
    canvasHeight: number,
    isValance: boolean
  ) {
    ctx.save();

    // Center coordinates
    const centerX = canvasWidth / 2;
    // For peaks, upper-middle area; for valance, center
    const defaultCenterY = isValance ? canvasHeight * 0.5 : canvasHeight * 0.42;
    const centerY = defaultCenterY + graphics.logoYOffset * (canvasHeight * 0.25);

    ctx.translate(centerX, centerY);

    if (graphics.logoRotation) {
      ctx.rotate((graphics.logoRotation * Math.PI) / 180);
    }

    // Determine target size
    const maxDimension = isValance ? canvasHeight * 0.75 : canvasWidth * 0.45;
    const baseScale = maxDimension * (graphics.logoScale || 1.0);

    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW: number;
    let drawH: number;

    if (aspect >= 1) {
      drawW = baseScale;
      drawH = baseScale / aspect;
    } else {
      drawH = baseScale;
      drawW = baseScale * aspect;
    }

    // Shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  /**
   * Render custom text with selected typography, contrast drop-shadow, and positioning
   */
  private renderText(
    ctx: CanvasRenderingContext2D,
    graphics: FaceGraphics,
    canvasWidth: number,
    canvasHeight: number,
    isValance: boolean
  ) {
    ctx.save();

    const fontSize = isValance
      ? Math.max(16, graphics.fontSize * 1.1)
      : Math.max(22, graphics.fontSize * 1.5);

    const fontFamily = graphics.fontFamily || 'Montserrat';
    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = canvasWidth / 2;
    // If logo is present on peak, text sits below logo; otherwise in center
    let defaultY: number;
    if (isValance) {
      defaultY = canvasHeight / 2;
    } else {
      defaultY = graphics.logoUrl ? canvasHeight * 0.72 : canvasHeight * 0.55;
    }

    const textY = defaultY + graphics.textYOffset * (canvasHeight * 0.25);

    // Subtle dark outer stroke/glow for readability on light fabrics
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = graphics.textColor || '#ffffff';
    ctx.fillText(graphics.text.toUpperCase(), centerX, textY);

    ctx.restore();
  }

  /**
   * Dispose all textures and clear references
   */
  public dispose() {
    this.textures.forEach((texture) => texture.dispose());
    this.textures.clear();
    this.canvases.clear();
    this.imageCache.clear();
  }
}
