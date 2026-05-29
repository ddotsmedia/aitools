import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { EnrichmentModule } from "./modules/enrichment/enrichment.module";
import { TaxonomyModule } from "./modules/taxonomy/taxonomy.module";
import { SearchModule } from "./modules/search/search.module";
import { HealthController } from "./health.controller";
// P4+: ReviewsModule, VerificationModule
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SearchModule,
    ToolsModule,
    EnrichmentModule,
    TaxonomyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
