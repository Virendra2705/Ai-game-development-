import { getDatabaseAdapter } from '../adapters';
import { Asset, AssetStatus, AssetCategory } from '../types';
import { activityService } from './activityService';

export class AssetService {
  private adapter = getDatabaseAdapter();

  async getAssets(projectId?: string): Promise<Asset[]> {
    return this.adapter.getAssets(projectId);
  }

  async getAssetById(id: string): Promise<Asset | null> {
    return this.adapter.getAssetById(id);
  }

  async createAsset(
    data: {
      projectId: string;
      name: string;
      type: AssetCategory | string;
      description: string;
      createdByAgentId?: string;
      status?: AssetStatus;
      thumbnailUrl?: string;
      fileSize?: string;
      format?: string;
      polyCount?: string;
    },
    actorName: string = 'Asset Agent'
  ): Promise<Asset> {
    const newAsset: Asset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: data.projectId,
      name: data.name,
      type: data.type,
      description: data.description,
      status: data.status || 'READY',
      version: '1.0',
      thumbnailUrl:
        data.thumbnailUrl ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      createdByAgentId: data.createdByAgentId || 'agent-asset',
      agentResponsibleId: data.createdByAgentId || 'agent-asset',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModified: 'Just now',
      fileSize: data.fileSize || '12.4 MB',
      size: data.fileSize || '12.4 MB',
      format: data.format || 'GLTF / PBR',
      polyCount: data.polyCount || '4,200',
      createdBy: actorName,
    };

    const saved = await this.adapter.saveAsset(newAsset);
    await activityService.logActivity(
      'ASSET_CREATED',
      actorName,
      `Generated asset: "${newAsset.name}" (${newAsset.type})`,
      newAsset.projectId,
      { assetId: newAsset.id, type: newAsset.type }
    );
    return saved;
  }

  async approveAsset(assetId: string, approverName: string = 'User Lead'): Promise<Asset | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset) return null;
    asset.status = 'APPROVED';
    asset.updatedAt = new Date().toISOString();
    asset.lastModified = 'Just now';
    const saved = await this.adapter.saveAsset(asset);
    await activityService.logActivity(
      'ASSET_APPROVED',
      approverName,
      `Approved asset: "${asset.name}" (${asset.version}) for workspace import`,
      asset.projectId,
      { assetId: asset.id }
    );
    return saved;
  }

  async rejectAsset(assetId: string, reason: string, actorName: string = 'User Lead'): Promise<Asset | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset) return null;
    asset.status = 'REJECTED';
    asset.updatedAt = new Date().toISOString();
    asset.lastModified = 'Just now';
    if (!asset.rejectionHistory) asset.rejectionHistory = [];
    asset.rejectionHistory.push({
      rejectedAt: new Date().toISOString(),
      rejectedBy: actorName,
      reason,
    });
    const saved = await this.adapter.saveAsset(asset);
    await activityService.logActivity(
      'ASSET_REJECTED',
      actorName,
      `Rejected asset "${asset.name}": ${reason}`,
      asset.projectId,
      { assetId: asset.id, reason }
    );
    return saved;
  }

  async importAssetToWorkspace(assetId: string, targetPath?: string): Promise<Asset | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset) return null;
    asset.status = 'IMPORTED';
    asset.fileLocation = targetPath || asset.fileLocation || `assets/${asset.type.toLowerCase()}/${asset.id}/`;
    asset.updatedAt = new Date().toISOString();
    asset.lastModified = 'Just now';
    const saved = await this.adapter.saveAsset(asset);
    await activityService.logActivity(
      'ASSET_IMPORTED',
      'Asset Import Service',
      `Imported asset "${asset.name}" to workspace: ${asset.fileLocation}`,
      asset.projectId,
      { assetId: asset.id, fileLocation: asset.fileLocation }
    );
    return saved;
  }

  async toggleFavorite(assetId: string): Promise<boolean> {
    const asset = await this.getAssetById(assetId);
    if (!asset) return false;
    asset.isFavorite = !asset.isFavorite;
    await this.adapter.saveAsset(asset);
    return !!asset.isFavorite;
  }

  async updateAsset(asset: Asset): Promise<Asset> {
    const saved = await this.adapter.saveAsset(asset);
    await activityService.logActivity(
      'ASSET_UPDATED',
      'Asset Agent',
      `Updated asset specs for: "${asset.name}"`,
      asset.projectId
    );
    return saved;
  }

  async deleteAsset(id: string): Promise<boolean> {
    return this.adapter.deleteAsset(id);
  }
}

export const assetService = new AssetService();
