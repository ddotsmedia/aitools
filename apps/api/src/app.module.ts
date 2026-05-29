import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { EnrichmentModule } from "./modules/enrichment/enrichment.module";
import { TaxonomyModule } from "./modules/taxonomy/taxonomy.module";
// P3+: SearchModule, ReviewsModule, VerificationModule
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ToolsModule,
    EnrichmentModule,
    TaxonomyModule,
  ],
})
export class AppModule {}
