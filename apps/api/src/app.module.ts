import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { EnrichmentModule } from "./modules/enrichment/enrichment.module";
import { TaxonomyModule } from "./modules/taxonomy/taxonomy.module";
import { SearchModule } from "./modules/search/search.module";
import { StackModule } from "./modules/stack/stack.module";
import { VerificationModule } from "./modules/verification/verification.module";
import { HealthController } from "./health.controller";
// P6+: ReviewsModule
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    SearchModule,
    ToolsModule,
    EnrichmentModule,
    TaxonomyModule,
    StackModule,
    VerificationModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
