import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { EnrichmentModule } from "./modules/enrichment/enrichment.module";
import { TaxonomyModule } from "./modules/taxonomy/taxonomy.module";
import { HealthController } from "./health.controller";
// P3+: SearchModule, ReviewsModule, VerificationModule
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ToolsModule,
    EnrichmentModule,
    TaxonomyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
